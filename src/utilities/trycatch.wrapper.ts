import type { Request, Response, NextFunction } from "express";
type controllerFunction = ({
  req,
  res,
  next,
}: {
  req: Request;
  res: Response;
  next: NextFunction;
}) => void | Promise<void>;
type errorConfiguration = (err: any) => void;

export function TryCatchController(
  controllerLogic: controllerFunction,
  {isAsync}: {isAsync: boolean},
  errorConfig?: errorConfiguration,
) {
  const asynchronous = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await controllerLogic({ req, res, next });
    } catch (err: any) {
      errorConfig?.(err);
      next(err)
    }
  };

  const nonasynchronous = (req: Request, res: Response, next: NextFunction) => {
    try {
      controllerLogic({ req, res, next });
    } catch (err: any) {
      errorConfig?.(err);
      next(err);
    }
  };

  return isAsync ? asynchronous : nonasynchronous;
}
