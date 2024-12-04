import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { extractJwt } from "src/utils/jwt.utils";

export const Token = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    return extractJwt(request);
  }
)