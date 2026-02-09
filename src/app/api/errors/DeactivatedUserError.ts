export class DeactivatedUserError extends Error {
  constructor() {
    super("탈퇴한 유저입니다.");
    this.name = "DeactivatedUserError";
  }
}

