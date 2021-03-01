import * as Generator from 'yeoman-generator';
export default class InitGenerator extends Generator {
    private answers;
    prompting(): Promise<void>;
    createSkeleton(): void;
    end(): void;
}
