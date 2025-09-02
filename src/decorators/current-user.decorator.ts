// import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// const getCurrentUserByContext = (context: ExecutionContext) =>
//   context.switchToHttp().getRequest().user;

// export const CurrentUser = createParamDecorator(
//   (_data: unknown, context: ExecutionContext) =>
//     getCurrentUserByContext(context),
// );

import { createParamDecorator, ExecutionContext } from "@nestjs/common";

const getCurrentUserByContext = (context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    console.log("CurrentUser decorator invoked");
    return getCurrentUserByContext(context);
  },
);
