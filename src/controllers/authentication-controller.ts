import { notFoundError } from "@/errors";
import authenticationService, { SignInParams } from "@/services/authentication-service";
import axios from "axios";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function singInPost(req: Request, res: Response) {
  const { email, password } = req.body as SignInParams;
  console.log("SIGN-IN BODY", req.body);

  try {
    const result = await authenticationService.signIn({ email, password });

    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.UNAUTHORIZED).send(error.message);
  }
}

export async function exChangeCodeForAcessToken(req: Request, res: Response) {
  console.log("ENTREI NO CONTROLLER", req.body);
  const { code } = req.body;
  const { REDIRECT_URL, CLIENT_ID, CLIENT_SECRET } = process.env;

  const GITHUB_ACESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
  const body = {
    code,
    grant_type: "authorization_URL",
    redirect_uri: REDIRECT_URL,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  };

  console.log("body: ", body);

  try {
    const response = await axios.post(GITHUB_ACESS_TOKEN_URL, body, {
      headers: {
        "Accept": "application/json"
      }
    });
    const token = response.data.access_token;

    console.log("token: ", token);

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const user = await authenticationService.signInOAuth(userResponse.data.email, token);
    console.log("user:", user);

    return res.status(httpStatus.OK).send(user);
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).send({});
  }
}
