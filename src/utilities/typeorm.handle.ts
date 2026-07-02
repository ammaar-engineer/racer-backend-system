import type { DataSource } from "typeorm";
import { ErrorTypeCall } from "../error_modules/error.class.js";

type RepositoryInstance = ReturnType<DataSource["getRepository"]>;
type SqliteErrorObjectKeys = "SQLITE_CONSTRIANT_UNIQUE";

export async function SqliteHandle<P>(
  RepoIns: RepositoryInstance,
  callbackAction: (RepoInsCb: RepositoryInstance) => P | Promise<P>,
  customConfig?: Record<SqliteErrorObjectKeys, () => void>,
): Promise<P> {
  try {
    return await callbackAction(RepoIns);
  } catch (err: any) {
    const errorCode = err?.driverError?.code;
    const SqliteErrorObject: Record<SqliteErrorObjectKeys, () => void> = {
      SQLITE_CONSTRIANT_UNIQUE: () =>
        ErrorTypeCall.conflict("Data already exist"),
      ...(customConfig as any),
    };
    
    if (errorCode && (SqliteErrorObject as any)[errorCode]) {
      (SqliteErrorObject as any)[errorCode]();
    }
    
    throw err;
  }
}
