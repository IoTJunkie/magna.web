export interface IObjection {
  id: string;
  name: string;
  description: string;
}

export interface IMagnaAnswer {
  question_id: string;
  answer: string;
  created: string;
}
export interface IQuestionInterrogative {
  id: string;
  object_list: IObjection[];
  question_detail: string;
  magna_answer: string | null;
  client_answers: IMagnaAnswer[];
  answer_document_ids: string[];
}

export interface IState {
  id: number;
  name: string;
}
