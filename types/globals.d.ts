//types/globals.d.ts
export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      profileId?: number;
      creatorName?: string;
    };
  }
}
