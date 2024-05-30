import { Challenge } from '../models/challenge';
import { User } from '../models/user';

class PreauthResponse {
    challenge: string;
    constructor(challenge: string) {
        this.challenge = challenge;
    }
}

export function preauthHandler(_req: any, res: any, _next: any) {
    const challenge = new Challenge()
    challenge.create()
        .then((challenge) => res.status(200).send(JSON.stringify(new PreauthResponse(challenge.id))))
        .catch((err) => console.log(err));
}

class AuthenticatedResponse {
    error: string | undefined;
    user: User | undefined;

    static fromUser(user: User): AuthenticatedResponse {
        const response = new AuthenticatedResponse();
        response.user = user;
        return response;
    }

    static fromError(error: string): AuthenticatedResponse {
        const response = new AuthenticatedResponse();
        response.error = error;
        return response;
    }
}

export async function authenticatedHandler(req: any, res: any, _next: any) {
    const code = req.params.challenge;
    let challenge = await Challenge.findById(code)
        .catch((_err) => res.status(200).send(JSON.stringify(AuthenticatedResponse.fromError(`Challenge code not found: ${code}`))));
    if (challenge.user_id != undefined) {
        User.findById(challenge.user_id)
            .then((user) => res.status(200).send(JSON.stringify(AuthenticatedResponse.fromUser(user))))
            .catch((_err) => res.status(200).send(JSON.stringify(AuthenticatedResponse.fromError("User not found"))));
        return;
    }
    res.status(200).send(JSON.stringify(new AuthenticatedResponse()));
}

class AuthenticateResponse {
    error: string | undefined;
    user: User | undefined;

    static fromUser(user: User): AuthenticateResponse {
        const response = new AuthenticateResponse();
        response.user = user;
        return response;
    }

    static fromError(error: string): AuthenticateResponse {
        const response = new AuthenticateResponse();
        response.error = error;
        return response;
    }
}

export async function authenticateHandler(req: any, res: any, _next: any) {
    if (!req.body) return res.status(400).send(JSON.stringify(AuthenticateResponse.fromError("No public key provided")));

    const publicKey = req.body.public_key;
    const userData = req.body.user;
    const code = req.params.challenge;

    if (!publicKey) return res.status(400).send(JSON.stringify(AuthenticateResponse.fromError("No public key provided")));

    Challenge.findById(code)
        .then((challenge) => {
            if (challenge.user_id && challenge.user_id != publicKey) {
                return res.status(400).send(JSON.stringify(AuthenticateResponse.fromError("Missing or bad challenge code sent")));
            }

            User.findByIdOrCreate(publicKey, userData)
                .then((user) => {
                    challenge.user_id = user.id;
                    challenge.update()
                        .then(() => res.status(200).send(JSON.stringify(AuthenticateResponse.fromUser(user))))
                        .catch((_err: any) => res.status(500).send(JSON.stringify(AuthenticateResponse.fromError("Internal server error"))));
                })
                .catch((_err) => res.status(500).send(JSON.stringify(AuthenticateResponse.fromError("Internal server error"))));
        })
        .catch((_err) => res.status(400).send(JSON.stringify(AuthenticateResponse.fromError(`Challenge code not found: ${code}`))));
}