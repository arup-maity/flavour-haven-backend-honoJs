import { sha256_hash } from "./utils";

interface CreateAuthOptions {
   state?: string;
   scopes?: string[];
   codeVerifier?: string;
}

interface TokenResponse {
   access_token: string;
   // Define the expected properties of the token response
}

export class GoogleAuth {
   clientId: string;
   clientSecret: string;
   redirectUrl: string;
   googleAuthUrl: string;
   tokenUrl: string;
   userInfo: string;

   constructor(obj: {
      clientId: string;
      clientSecret: string;
      redirectUrl: string;
   }) {
      if (typeof obj !== "object" || Array.isArray(obj) || obj === null) {
         throw new Error(
            "Constructor must be called with a single object argument"
         );
      }
      this.clientId = obj.clientId;
      this.clientSecret = obj.clientSecret;
      this.redirectUrl = obj.redirectUrl;
      this.googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      this.tokenUrl = "https://oauth2.googleapis.com/token";
      this.userInfo = "https://openidconnect.googleapis.com/v1/userinfo";
   }

   async createAuthorizationUrl(options: CreateAuthOptions): Promise<string> {
      const googleScopes = options.scopes || ["profile", "email", "openid"];
      const googleState = options.state || "home";
      const getScopes = Array.from(new Set(googleScopes));

      const authorizationUrl = new URL(this.googleAuthUrl);
      authorizationUrl.searchParams.set("response_type", "code");
      authorizationUrl.searchParams.set("state", googleState);
      authorizationUrl.searchParams.set("client_id", this.clientId);
      authorizationUrl.searchParams.set("scope", getScopes.join(" "));
      authorizationUrl.searchParams.set("redirect_uri", this.redirectUrl);

      if (options.codeVerifier) {
         const codeChallenge = await sha256_hash(options.codeVerifier);
         authorizationUrl.searchParams.set("code_challenge_method", "S256");
         authorizationUrl.searchParams.set("code_challenge", codeChallenge);
      }

      return authorizationUrl.toString();
   }

   async verifyAuthorizationUser(code: string): Promise<TokenResponse> {
      const headers = new Headers();
      headers.set("Content-Type", "application/x-www-form-urlencoded");
      headers.set("Accept", "application/json");

      const body = new URLSearchParams();
      body.set("code", code);
      body.set("client_id", this.clientId);
      body.set("client_secret", this.clientSecret);
      body.set("redirect_uri", this.redirectUrl);
      body.set("grant_type", "authorization_code");

      const request = new Request(this.tokenUrl, {
         method: "POST",
         headers,
         body
      });
      const response = await fetch(request);
      const result = await response.json();

      return await this.getUserDetails(result.access_token);
   }

   async getUserDetails(accessToken: string): Promise<any> {
      const response = await fetch(this.userInfo, {
         headers: {
            Authorization: `Bearer ${accessToken}`
         }
      });
      return await response.json();
   }
}