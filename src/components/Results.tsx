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

    // Simple Header Background
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Quiz Performance Report', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }), pageWidth / 2, 38, { align: 'center' });

    // Student Info Box
    let yPos = 65;
    doc.setFillColor(243, 244, 246);
    doc.rect(20, yPos, pageWidth - 40, 45, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos, pageWidth - 40, 45);
    
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', 25, yPos + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    yPos += 17;
    doc.text(`Name: ${userName || 'N/A'}`, 25, yPos);
    yPos += 7;
    doc.text(`Email: ${userEmail || 'N/A'}`, 25, yPos);
    yPos += 7;
    doc.text(`Mobile: ${userMobile || 'N/A'}`, 25, yPos);
    yPos += 7;
    doc.text(`College: ${userCollege || 'N/A'}`, 25, yPos);

    // Large Score Display
    yPos += 25;
    const scoreBoxHeight = 50;
    
    // Score percentage determines color
    let scoreColor: [number, number, number] = [34, 197, 94]; // Green
    if (scorePercentage < 50) {
      scoreColor = [239, 68, 68]; // Red
    } else if (scorePercentage < 70) {
      scoreColor = [251, 146, 60]; // Orange
    }
    
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.roundedRect(pageWidth / 2 - 35, yPos, 70, scoreBoxHeight, 5, 5, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('YOUR SCORE', pageWidth / 2, yPos + 12, { align: 'center' });
    
    doc.setFontSize(40);
    doc.text(`${scorePercentage}%`, pageWidth / 2, yPos + 32, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${correctAnswers} out of ${totalQuestions}`, pageWidth / 2, yPos + 43, { align: 'center' });

    // Performance Status
    yPos += scoreBoxHeight + 15;
    let performanceText = 'Excellent!';
    let performanceBg: [number, number, number] = [34, 197, 94];
    
    if (scorePercentage >= 70) {
      performanceText = '⭐ Excellent Performance!';
      performanceBg = [34, 197, 94];
    } else if (scorePercentage >= 50) {
      performanceText = '👍 Good Job!';
      performanceBg = [251, 146, 60];
    } else {
      performanceText = '📚 Keep Practicing!';
      performanceBg = [239, 68, 68];
    }
    
    doc.setFillColor(performanceBg[0], performanceBg[1], performanceBg[2]);
    doc.roundedRect(40, yPos, pageWidth - 80, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(performanceText, pageWidth / 2, yPos + 8, { align: 'center' });

    // Statistics Table
    yPos += 25;
    doc.setFillColor(243, 244, 246);
    doc.rect(20, yPos, pageWidth - 40, 40, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.rect(20, yPos, pageWidth - 40, 40);
    
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Quiz Statistics', 25, yPos + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    yPos += 17;
    doc.text(`Total Questions: ${totalQuestions}`, 25, yPos);
    doc.text(`Time Taken: ${minutes}m ${seconds}s`, pageWidth / 2 + 10, yPos);
    
    yPos += 7;
    doc.setTextColor(34, 197, 94);
    doc.text(`Correct: ${correctAnswers}`, 25, yPos);
    doc.setTextColor(239, 68, 68);
    doc.text(`Incorrect: ${totalQuestions - correctAnswers}`, pageWidth / 2 + 10, yPos);
    
    yPos += 7;
    doc.setTextColor(59, 130, 246);
    doc.text(`Accuracy: ${scorePercentage}%`, 25, yPos);

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
    
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Quiz Challenge Platform', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Keep practicing to achieve better results!', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save
    doc.save(`Quiz_Report_${userName?.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl shadow-2xl max-w-2xl w-full"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-400">
            <CheckCircle className="w-12 h-12 text-green-400" />
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
            <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 p-4 rounded-xl">
              <div className="text-amber-300 font-semibold text-lg mb-1">Performance</div>
              <div className="text-2xl font-bold text-white">
                {scorePercentage >= 70 ? 'Excellent!' : scorePercentage >= 50 ? 'Good' : 'Practice'}
              </div>
              <div className="text-sm text-amber-200">Keep going!</div>
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
                <Mail className="w-5 h-5 text-green-400" />
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
            className="w-full mb-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
          >
            <Download size={20} />
            Download PDF Report
          </button>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
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