import { User } from "../models/User.model.js";

export async function findUserByUsernameOrAlias(username: string) {
  return await User.findOne({
    $or: [{ username }, { previousUsernames: username }],
  });
}
