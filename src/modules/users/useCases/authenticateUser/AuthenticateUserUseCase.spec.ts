import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoriesInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Show profile user", () => {
  beforeEach(() => {
    usersRepositoriesInMemory = new InMemoryUsersRepository();

    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoriesInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoriesInMemory);
  });

  it("Should be able to authenticated a user", async () => {
    const user = {
      name: "Name Test",
      email: "Email Test",
      password: "12345"
    };

    await createUserUseCase.execute(user);

    const response = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(response.user).toHaveProperty("id");
    expect(response.user.email).toBe("Email Test");
    expect(response).toHaveProperty("token");
  });

  it("Should not be able to authenticate a user, if password is incorrect", async () => {
    expect(async () => {
      const user = {
        name: "Name Test",
        email: "Email Test",
        password: "12345"
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "password incorrect"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user, if email is incorrect", async () => {
    expect(async () => {
      const user = {
        name: "Name Test",
        email: "Email Test",
        password: "12345"
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: "email incorrect",
        password: user.password
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
