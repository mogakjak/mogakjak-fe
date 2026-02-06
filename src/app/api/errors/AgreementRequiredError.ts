export class AgreementRequiredError extends Error {
  readonly hasToken: boolean;

  constructor(hasToken: boolean) {
    super("필수 약관 동의가 필요합니다.");
    this.name = "AgreementRequiredError";
    this.hasToken = hasToken;
  }
}

