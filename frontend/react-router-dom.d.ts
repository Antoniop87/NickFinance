import { RouteComponentProps } from 'react-router-dom';

interface RouteParams {
  userId: string;
}

declare module 'react-router-dom' {
  interface RouteParams {
    userId: string;
  }
}
