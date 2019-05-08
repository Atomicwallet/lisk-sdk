import BaseCommand from '../../base';
export default class SetCommand extends BaseCommand {
    static args: ({
        name: string;
        required: boolean;
        options: string[];
        description: string;
    } | {
        name: string;
        required: boolean;
        description: string;
        options?: undefined;
    })[];
    static description: string;
    static examples: string[];
    run(): Promise<void>;
}
