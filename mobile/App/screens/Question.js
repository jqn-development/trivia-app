import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import Container from "../components/Container";
import Card from "../components/Card";
import { QuestionText } from "../components/Text";
import { PrimaryButton, ButtonPlaceholder } from "../components/Button";
import QuestionRow from "../components/QuestionRow";
import AnswerRow from "../components/AnswerRow";

import API from "../util/api";

export default class App extends React.Component {
  state = {
    answered: false,
    wasCorrect: null,
    userAnswer: {},
    questions: []
  };

  componentDidMount() {
    API.getQuestions().then(data => {
      if (data.questions.length === 0) {
        this.props.goTo("Waiting", { nextQuestionTime: data.nextQuestionTime });
      }

      this.setState({
        questions: data.questions,
        nextQuestionTime: data.nextQuestionTime
      });
    });
  }

  handleAnswer = (question, answer) => {
    this.setState({
      answered: true,
      wasCorrect: answer.correct,
      userAnswer: answer
    });

    API.answerQuestion(question, answer);
  };

  handleNext = () => {
    this.props.goTo("Waiting", {
      nextQuestionTime: this.state.nextQuestionTime
    });
  };

  renderResults = ({ answers, totalResponses }) => (
    <View>
      {answers.map(answer => {
        const wasUserAnswer = answer.answer === this.state.userAnswer.answer;
        return (
          <AnswerRow
            key={answer.answer}
            answer={answer.answer}
            answerResponses={
              wasUserAnswer ? answer.answerCount + 1 : answer.answerCount
            }
            totalResponses={totalResponses + 1}
            wasUserAnswer={wasUserAnswer}
            wasCorrect={this.state.wasCorrect}
          />
        );
      })}
    </View>
  );

  renderQuestions = question => (
    <View>
      {question.answers.map(answer => (
        <QuestionRow
          key={answer.answer}
          answer={answer.answer}
          onPress={() => this.handleAnswer(question, answer)}
        />
      ))}
    </View>
  );

  render() {
    if (this.state.questions.length === 0) {
      return null;
    }

    const currentQuestion = this.state.questions[0];
    return (
      <Container>
        <Card>
          <QuestionText>{currentQuestion.question}</QuestionText>
          {this.state.answered
            ? this.renderResults(currentQuestion)
            : this.renderQuestions(currentQuestion)}
        </Card>
        {this.state.answered ? (
          <PrimaryButton onPress={this.handleNext}>Next</PrimaryButton>
        ) : (
          <ButtonPlaceholder />
        )}
      </Container>
    );
  }
}
