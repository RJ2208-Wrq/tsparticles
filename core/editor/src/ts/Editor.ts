import { EditorContainer } from "./editors/EditorContainer";
import { Container } from "tsparticles/dist/Core/Container";
import { OptionsEditor } from "./sections/OptionsEditor";

export class Editor {
    public readonly container: EditorContainer;

    constructor(public readonly particles: Container) {
        this.container = new EditorContainer(particles, "root", "tsParticles", document.body);

        this.addOptions();
        this.addButtons();
    }

    private addOptions() {
        const options = new OptionsEditor(this.container);
    }

    private addButtons() {
        this.container.addButton("play", "Play", () => {
            this.particles.play();
        });
        this.container.addButton("pause", "Pause", () => {
            this.particles.pause();
        });
        this.container.addButton("refresh", "Refresh", async () => {
            await this.particles.refresh();
        });
        this.container.addButton("start", "Start", async () => {
            await this.particles.start();
        });
        this.container.addButton("stop", "Stop", () => {
            this.particles.stop();
        });
    }
}
