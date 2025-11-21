import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, RotateCcw, Download, User, Mail, Phone, GraduationCap } from 'lucide-react';
import jsPDF from 'jspdf';

interface ResultsProps {
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  onRestart: () => void;
  userEmail?: string;
  userName?: string;
  userMobile?: string;
  userCollege?: string;
}

const Results: React.FC<ResultsProps> = ({ 
  correctAnswers,
  totalQuestions,
  timeTaken,
  onRestart,
  userEmail,
  userName,
  userMobile,
  userCollege
}) => {
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header - SWAVIK INTERNSHIP
    doc.setFillColor(88, 28, 135); // Purple
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SWAVIK INTERNSHIP', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Quiz Result Summary', pageWidth / 2, 25, { align: 'center' });

    // Generated timestamp
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric'
    }) + ' at ' + now.toLocaleTimeString('en-US');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${timestamp}`, pageWidth / 2, 45, { align: 'center' });

    // Student Details Section
    let yPos = 58;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(88, 28, 135);
    doc.text('Student Details', 20, yPos);
    
    yPos += 2;
    doc.setDrawColor(88, 28, 135);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Name:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(userName || 'N/A', 50, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(userEmail || 'N/A', 50, yPos);
    
    if (userMobile) {
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Mobile:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(userMobile, 50, yPos);
    }
    
    if (userCollege) {
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('College:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(userCollege, 50, yPos);
    }

    // Large Score Circle
    yPos += 20;
    const centerX = pageWidth / 2;
    const circleRadius = 25;
    
    // Score color based on percentage
    let scoreColor: [number, number, number] = [220, 38, 38]; // Red
    let performanceText = 'Keep Practicing!';
    
    if (scorePercentage >= 70) {
      scoreColor = [34, 197, 94]; // Green
      performanceText = 'Excellent!';
    } else if (scorePercentage >= 50) {
      scoreColor = [234, 179, 8]; // Yellow
      performanceText = 'Good Job!';
    }
    
    // Draw circle
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.circle(centerX, yPos + circleRadius, circleRadius, 'F');
    
    // Score text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text(`${scorePercentage}%`, centerX, yPos + circleRadius + 5, { align: 'center' });
    
    // Performance text below circle
    yPos += circleRadius * 2 + 10;
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(performanceText, centerX, yPos, { align: 'center' });

    // Quiz Performance Section
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(88, 28, 135);
    doc.text('Quiz Performance', 20, yPos);
    
    yPos += 2;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Total Questions:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(totalQuestions), 70, yPos);
    
    // Right column
    doc.setFont('helvetica', 'bold');
    doc.text('Accuracy:', pageWidth / 2 + 10, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${scorePercentage}%`, pageWidth / 2 + 40, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Correct Answers:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(34, 197, 94);
    doc.text(String(correctAnswers), 70, yPos);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Time Taken:', pageWidth / 2 + 10, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${minutes}m ${seconds}s`, pageWidth / 2 + 40, yPos);

    // Quiz Breakdown Section
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(88, 28, 135);
    doc.text('Quiz Breakdown', 20, yPos);
    
    yPos += 2;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('• Standard Round: 8 questions', 25, yPos);
    
    yPos += 7;
    doc.text('• Final Boss Round: 7 questions', 25, yPos);

    // Footer
    yPos += 20;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPos, pageWidth - 40, 20, 'F');
    
    doc.setTextColor(88, 28, 135);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for participating in the SWAVIK Internship Quiz!', pageWidth / 2, yPos + 8, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('This document was generated automatically', pageWidth / 2, yPos + 15, { align: 'center' });

    // Save PDF
    doc.save(`SWAVIK_Quiz_Report_${userName?.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl max-w-2xl w-full"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-400">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h1>
          <p className="text-gray-300 mb-8">Your results have been saved successfully.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 p-4 rounded-xl">
              <div className="text-blue-300 font-semibold text-lg mb-1">Score</div>
              <div className="text-3xl font-bold text-white">{correctAnswers}/{totalQuestions}</div>
              <div className="text-sm text-blue-200">{scorePercentage}%</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 p-4 rounded-xl">
              <div className="text-purple-300 font-semibold text-lg mb-1">Time Spent</div>
              <div className="text-2xl font-bold text-white">
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </div>
              <div className="text-sm text-purple-200">minutes</div>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 p-4 rounded-xl">
              <div className="text-emerald-300 font-semibold text-lg mb-1">Performance</div>
              <div className="text-2xl font-bold text-white">
                {scorePercentage >= 70 ? 'Excellent!' : scorePercentage >= 50 ? 'Good' : 'Practice'}
              </div>
              <div className="text-sm text-emerald-200">Keep going!</div>
            </div>
          </div>

          {/* Student Details Box */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              Student Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-xs text-gray-400">Name</div>
                  <div className="font-semibold text-white">{userName || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <Mail className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs text-gray-400">Email</div>
                  <div className="font-semibold text-white text-sm break-all">{userEmail || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <Phone className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-xs text-gray-400">Mobile</div>
                  <div className="font-semibold text-white">{userMobile || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <GraduationCap className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-xs text-gray-400">College</div>
                  <div className="font-semibold text-white text-sm">{userCollege || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Download PDF Report Button */}
          <button
            onClick={handleDownloadPDF}
            className="w-full mb-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
          >
            <Download size={20} />
            Download PDF Report
          </button>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <RotateCcw size={18} />
              Take Quiz Again
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 

export default Results;