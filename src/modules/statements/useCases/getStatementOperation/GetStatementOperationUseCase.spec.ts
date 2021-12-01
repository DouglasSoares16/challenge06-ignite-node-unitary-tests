import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryinMemory: IUsersRepository;
let statementsRepositoryinMemory: IStatementsRepository;

let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement Operation', () => {
  beforeEach(() => {
    usersRepositoryinMemory = new InMemoryUsersRepository();
    statementsRepositoryinMemory = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryinMemory,
      statementsRepositoryinMemory,
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryinMemory,
      statementsRepositoryinMemory,
    );
  });

  it("Should be able to get statement operation", async () => {
    const user = await usersRepositoryinMemory.create({
      name: "Name Test",
      email: "Email Test",
      password: "12345",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 400,
      description: "Create Deposit Test",
    });

    const response = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(response).toHaveProperty("id");
    expect(response.id).toEqual(statement.id);
    expect(response.type).toBe("deposit");
    expect(response).toEqual(statement);
  });

  it("Should not be able to get statement operation, if user not exists", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: "User not exists",
        statement_id: "Statement not exists",
      }),
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get statement operation, if not exists none statement operation", async () => {
    const user = await usersRepositoryinMemory.create({
      name: "Name Test",
      email: "Email Test",
      password: "12345",
    });

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "Statement not exists",
      }),
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
