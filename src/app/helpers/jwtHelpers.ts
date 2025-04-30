
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
interface IPayload {
  email: string,
  role: "ADMIN" | "USER"
}
const createToken = (payload: IPayload, secret: Secret, expiresIn: number | undefined) => {
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn,
  });
  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
