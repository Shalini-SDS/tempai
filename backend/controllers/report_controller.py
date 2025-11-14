from flask import Blueprint, jsonify, send_file
from models.user_model import User
from functools import wraps
import jwt
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime

report_bp = Blueprint('report', __name__, url_prefix='/api/report')
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in kwargs:
            token = kwargs['Authorization']
        
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        
        try:
            token = token.split(" ")[1] if " " in token else token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

@report_bp.route('/health-summary', methods=['POST'])
def generate_health_summary():
    try:
        from flask import request
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"message": "Token is missing"}), 401
        
        try:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data['user_id']
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            return jsonify({"message": "Invalid token"}), 401
        
        user = User.get_user_by_id(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        request_data = request.get_json()
        temperature = request_data.get('temperature', 'N/A')
        symptoms = request_data.get('symptoms', [])
        prediction = request_data.get('prediction', 'N/A')
        confidence = request_data.get('confidence', 0)
        
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=30,
            alignment=1
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#764ba2'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        story.append(Paragraph("🌡️ TempAI - Health Summary Report", title_style))
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("Patient Information", heading_style))
        patient_data = [
            ['Name:', user.get('name', 'N/A')],
            ['Email:', user.get('email', 'N/A')],
            ['Age:', str(user.get('age', 'N/A'))],
            ['Allergies:', user.get('allergies', 'None reported')],
            ['Report Date:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')]
        ]
        patient_table = Table(patient_data, colWidths=[1.5*inch, 4.5*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        story.append(patient_table)
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("Current Health Status", heading_style))
        health_data = [
            ['Temperature:', f'{temperature}°C'],
            ['Symptoms:', ', '.join(symptoms) if symptoms else 'None reported'],
            ['AI Prediction:', prediction],
            ['Confidence:', f'{confidence*100:.1f}%']
        ]
        health_table = Table(health_data, colWidths=[1.5*inch, 4.5*inch])
        health_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        story.append(health_table)
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("Recommendations", heading_style))
        recommendations_text = """
        <br/>• Stay hydrated - Drink water, herbal tea, or electrolyte solutions<br/>
        • Rest adequately - Aim for 8-10 hours of sleep<br/>
        • Monitor temperature regularly and record readings<br/>
        • Consult a doctor if symptoms persist beyond 3 days<br/>
        • If temperature exceeds 40°C, seek immediate medical attention<br/>
        """
        story.append(Paragraph(recommendations_text, styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("Disclaimer", ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey
        )))
        disclaimer = "This report is generated by TempAI and is for informational purposes only. It is not a substitute for professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment."
        story.append(Paragraph(disclaimer, styles['Normal']))
        
        doc.build(story)
        pdf_buffer.seek(0)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"health_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
            max_age=0
        )
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"PDF generation error: {str(e)}")
        print(error_trace)
        return jsonify({
            "message": "Failed to generate PDF",
            "error": str(e),
            "details": error_trace
        }), 500
