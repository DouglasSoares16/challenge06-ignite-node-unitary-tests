import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "./CreateStatementController";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to possible to perform the deposit operation", async () => {
    const user = {
      name: "Name Test",
      email: "Email Test",
      password: "12345"
    };

    const userCreated = await createUserUseCase.execute(user);

    const response = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      description: "Create Deposit Test",
      type: OperationType["DEPOSIT"],
      amount: 400
    });

    expect(response).toHaveProperty("id");
    expect(response.amount).toBe(400);
    expect(response.type).toBe("deposit");
  });

  it("Should be able to possible to perform the withdraw operation", async () => {
    const user = {
      name: "Name Test",
      email: "Email Test",
      password: "12345"
    };

    const userCreated = await createUserUseCase.execute(user);

    await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      description: "Create Deposit Test",
      type: OperationType["DEPOSIT"],
      amount: 400
    });

    const response = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      description: "Create Withdraw Test",
      type: OperationType["WITHDRAW"],
      amount: 200
    });

    expect(response).toHaveProperty("id");
    expect(response.type).toBe("withdraw");
    expect(response.amount).toBe(200);
  });

  it("Should not be able to create statement, if user not exists", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "User not exists",
        description: "Create Deposit Test",
        type: OperationType["DEPOSIT"],
        amount: 200
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to possible to perform the withdraw operation, if balance less than amount", () => {
    expect(async () => {
      const user = {
        name: "Name Test",
        email: "Email Test",
        password: "12345"
      };

      const userCreated = await createUserUseCase.execute(user);

      await createStatementUseCase.execute({
        user_id: userCreated.id as string,
        description: "Create Deposit Test",
        type: OperationType["DEPOSIT"],
        amount: 400
      });

      await createStatementUseCase.execute({
        user_id: userCreated.id as string,
        description: "Create Withdraw Test",
        type: OperationType["WITHDRAW"],
        amount: 800
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
