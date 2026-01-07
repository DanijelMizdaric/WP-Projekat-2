

import { Component } from '@angular/core';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent {

  quizData = [
    {
      id: 1,
      question: "Šta predstavlja HTML?",
      options: [
        { value: "a", text: "Programski jezik" },
        { value: "b", text: "Jezik za strukturiranje web stranice" },
        { value: "c", text: "Baza podataka" }
      ],
      correct: ["b"],
      type: "radio"
    },
    {
      id: 2,
      question: "Koji tag se koristi za najveći naslov?",
      options: [
        { value: "a", text: "<h6>" },
        { value: "b", text: "<title>" },
        { value: "c", text: "<h1>" }
      ],
      correct: ["c"],
      type: "radio"
    },

  ];

  userAnswers: { [key: number]: string[] } = {};
  score: number | null = null;
  totalQuestions: number = this.quizData.length;

  checkAnswers(): void {
    let currentScore = 0;

    this.quizData.forEach(q => {
      const selected = this.userAnswers[q.id] || [];
      const correct = q.correct;

      if (selected.length === correct.length && selected.every(val => correct.includes(val))) {
        currentScore++;
      }
    });

    this.score = currentScore;
  }

  resetQuiz(): void {
    this.userAnswers = {};
    this.score = null;

  }
}