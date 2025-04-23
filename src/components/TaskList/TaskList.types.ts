export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

export type Collaborator = {
  email: string;
  role: "admin" | "viewer";
};