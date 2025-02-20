import { Honeypot } from "remix-utils/honeypot/server";

export const honeypot = new Honeypot({
  randomizeNameFieldName: false,
  nameFieldName: "name__confirm",
  validFromFieldName: "from__confirm",
  encryptionSeed: undefined
});
