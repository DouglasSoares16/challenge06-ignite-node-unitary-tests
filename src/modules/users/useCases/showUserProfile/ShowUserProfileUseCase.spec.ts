import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoriesInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show profile user", () => {
  beforeEach(() => {
    usersRepositoriesInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoriesInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoriesInMemory);
  });

  it("Should be able to list profile of user", async () => {
    const user = {
      name: "Name Test",
      email: "Email Test",
      password: "12345"
    };

    const createdUser = await createUserUseCase.execute(user);

    const profile = await showUserProfileUseCase.execute(createdUser.id as string);

    expect(profile).toHaveProperty("id");
    expect(profile.name).toBe("Name Test");
  });

  it("Should not be able to list profile, if user does not exists", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("User Not exists");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
