import sessionRepository from "@/repositories/session-repository";
import userRepository from "@/repositories/user-repository";
import { exclude } from "@/utils/prisma-utils";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { string } from "joi";
import jwt from "jsonwebtoken";
import { invalidCredentialsError } from "./errors";

async function signIn(params: SignInParams): Promise<SignInResult> {
  const { email, password } = params;

  const user = await getUserOrFail(email);

  await validatePasswordOrFail(password, user.password);

  const token = await createSession(user.id);

  return {
    user: exclude(user, "password"),
    token,
  };
}
async function signInOAuth(email: string): Promise<SignInResult> {
  const user = await getUserOrFailOAuth(email);

  const userToken = await createSession(user.id); 
  
  return {
    user: {
      email: user.email,
      id: user.id
    },
    token: userToken,
  };
}

async function getUserOrFailOAuth(email: string): Promise<GetUserOrFailResult> {
  let user = await userRepository.findByEmail(email, { id: true, email: true, password: true });
  if (!user) {  //If user is not registered yet, creates a new user with a random password, user should be able to login with github nonetheless
    user = await userRepository.create({ email: email, password: createRandomPassword() });
  }
  return user;
}

function createRandomPassword() {
  let password = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i<64; i++) {
    password += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return password;
}

async function getUserOrFail(email: string): Promise<GetUserOrFailResult> {
  const user = await userRepository.findByEmail(email, { id: true, email: true, password: true });
  if (!user) throw invalidCredentialsError();

  return user;
}

async function createSession(userId: number) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  await sessionRepository.create({
    token,
    userId,
  });

  return token;
}

async function validatePasswordOrFail(password: string, userPassword: string) {
  const isPasswordValid = await bcrypt.compare(password, userPassword);
  if (!isPasswordValid) throw invalidCredentialsError();
}

export type SignInParams = Pick<User, "email" | "password">;

type SignInResult = {
  user: Pick<User, "id" | "email">;
  token: string;
};

type GetUserOrFailResult = Pick<User, "id" | "email" | "password">;

const authenticationService = {
  signIn,
  signInOAuth
};

export default authenticationService;
export * from "./errors";
