import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to get all balance of user", async () => {
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
      amount: 200
    });

    const response = await getBalanceUseCase.execute({
      user_id: userCreated.id as string,
    });

    expect(response.statement).toHaveLength(2);
    expect(response.balance).toBe(200);
  });

  it("Should not be able to get all balance of user, if user not exists", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "User not exists",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
