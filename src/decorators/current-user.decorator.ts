// import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// const getCurrentUserByContext = (context: ExecutionContext) =>
//   context.switchToHttp().getRequest().user;

// export const CurrentUser = createParamDecorator(
//   (_data: unknown, context: ExecutionContext) =>
//     getCurrentUserByContext(context),
// );

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getCurrentUserByContext = (context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  // console.log('Request Object:', request); // Logs the entire request object for debugging
  console.log('User Object:', request.user); // Logs the user object attached to the request (if any)
  return request.user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    console.log('CurrentUser decorator invoked');
    return getCurrentUserByContext(context);
  },
);
