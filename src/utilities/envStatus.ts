import 'dotenv/config'

export function EnvVariable(variabel: string) {
    return process.env[variabel]
}