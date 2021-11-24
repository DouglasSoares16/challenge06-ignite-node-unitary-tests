import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepositoriesInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create a new User", () => {
  beforeEach(() => {
    usersRepositoriesInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoriesInMemory);
  });

  it("Should be abe to create a new user", async () => {
    const user = {
      name: "Name Test",
      email: "Email Test",
      password: "12345"
    };

    const response = await createUserUseCase.execute(user);

    expect(response).toHaveProperty("id");
    expect(response.email).toBe("Email Test");
  });

  it("Should not be able to create a new user with email exists", async () => {
    expect(async () => {
      const user = {
        name: "Name Test",
        email: "Email Test",
        password: "12345"
      };

      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
