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
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background gradient effect (using rectangles)
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('QUIZ PERFORMANCE REPORT', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(currentDate, pageWidth / 2, 30, { align: 'center' });

    // Student Information Section
    let yPos = 55;
    doc.setFillColor(248, 249, 255);
    doc.roundedRect(15, yPos, pageWidth - 30, 50, 3, 3, 'F');
    
    doc.setTextColor(102, 126, 234);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('👤 STUDENT INFORMATION', 20, yPos + 10);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(userName || 'N/A', 55, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(userEmail || 'N/A', 55, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Mobile:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(userMobile || 'N/A', 55, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('College:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(userCollege || 'N/A', 55, yPos);

    // Performance Score Cards
    yPos += 25;
    
    // Score Card 1 - Final Score
    const cardWidth = 55;
    const cardHeight = 35;
    const cardSpacing = 8;
    let xPos = 15;
    
    doc.setFillColor(102, 126, 234);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FINAL SCORE', xPos + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(24);
    doc.text(`${correctAnswers}/${totalQuestions}`, xPos + cardWidth / 2, yPos + 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${scorePercentage}%`, xPos + cardWidth / 2, yPos + 30, { align: 'center' });
    
    // Score Card 2 - Time Taken
    xPos += cardWidth + cardSpacing;
    doc.setFillColor(132, 250, 176);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TIME TAKEN', xPos + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(24);
    doc.text(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`, xPos + cardWidth / 2, yPos + 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('minutes', xPos + cardWidth / 2, yPos + 30, { align: 'center' });
    
    // Score Card 3 - Accuracy
    xPos += cardWidth + cardSpacing;
    doc.setFillColor(255, 236, 210);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCURACY', xPos + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(24);
    doc.text(`${scorePercentage}%`, xPos + cardWidth / 2, yPos + 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('correct', xPos + cardWidth / 2, yPos + 30, { align: 'center' });

    // Performance Badge
    yPos += 50;
    let badgeText = '';
    let badgeColor: [number, number, number] = [102, 126, 234];
    
    if (scorePercentage >= 70) {
      badgeText = '🌟 EXCELLENT PERFORMANCE!';
      badgeColor = [17, 153, 142];
    } else if (scorePercentage >= 50) {
      badgeText = '👍 GOOD JOB!';
      badgeColor = [240, 147, 251];
    } else {
      badgeText = '📚 NEEDS MORE PRACTICE';
      badgeColor = [252, 182, 159];
    }
    
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.roundedRect(40, yPos, pageWidth - 80, 15, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(badgeText, pageWidth / 2, yPos + 10, { align: 'center' });

    // Detailed Statistics Section
    yPos += 30;
    doc.setFillColor(248, 249, 255);
    doc.roundedRect(15, yPos, pageWidth - 30, 45, 3, 3, 'F');
    
    doc.setTextColor(102, 126, 234);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 DETAILED STATISTICS', 20, yPos + 10);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Questions:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(totalQuestions), 70, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Correct Answers:', 20, yPos);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(String(correctAnswers), 70, yPos);
    
    yPos += 8;
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.text('Incorrect Answers:', 20, yPos);
    doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.text(String(totalQuestions - correctAnswers), 70, yPos);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Quiz Challenge Platform', pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.setFontSize(8);
    doc.text('This is an official quiz performance report. Keep practicing to improve your score!', pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    // Border
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.rect(10, 45, pageWidth - 20, pageHeight - 55);

    // Save PDF
    doc.save(`Quiz_Report_${userName?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Submitted!</h1>
          <p className="text-gray-600 mb-8">Your results have been saved successfully.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 font-semibold text-lg mb-1">Score</div>
              <div className="text-3xl font-bold">{correctAnswers}/{totalQuestions}</div>
              <div className="text-sm text-gray-500">{scorePercentage}%</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 font-semibold text-lg mb-1">Time Spent</div>
              <div className="text-2xl font-bold">
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </div>
              <div className="text-sm text-gray-500">minutes:seconds</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-amber-600 font-semibold text-lg mb-1">Performance</div>
              <div className="text-2xl font-bold">
                {scorePercentage >= 70 ? 'Great!' : scorePercentage >= 50 ? 'Good' : 'Needs Practice'}
              </div>
              <div className="text-sm text-gray-500">Keep it up!</div>
            </div>
          </div>

          {/* Student Details Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              Student Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="font-semibold text-gray-800">{userName || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-semibold text-gray-800 text-sm break-all">{userEmail || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-500">Mobile</div>
                  <div className="font-semibold text-gray-800">{userMobile || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <GraduationCap className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-xs text-gray-500">College</div>
                  <div className="font-semibold text-gray-800 text-sm">{userCollege || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Download PDF Report Button */}
          <button
            onClick={handleDownloadPDF}
            className="w-full mb-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <Download size={20} />
            Download PDF Report
          </button>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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