export interface Column {
  id: number;
  boardId: number;
  name: string;
  position: number;
}

export interface Card {
  id: number;
  columnId: number;
  categoryId: number | null;
  title: string;
  description: string;
  isComplete: boolean;
  position: number;
}

export interface Category {
  id: number;
  boardId: number;
  name: string;
  color: string;
}

export interface Member {
  userId: number;
  username: string;
  role: string;
}
