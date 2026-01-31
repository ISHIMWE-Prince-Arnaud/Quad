import { User } from "../models/User.model.js";

export async function findUserByUsername(username: string) {
  return await User.findOne({ username });
}
