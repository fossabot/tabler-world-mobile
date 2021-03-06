import spwan from 'cross-spawn';
import { createEnv } from '../helper/createEnv';
import { TermSignals } from '../helper/TermSignals';

// tslint:disable-next-line: export-name
export default () => {
    const finalEnv = createEnv();
    const [, , cmd, ...args] = process.argv;

    if (cmd == null) {
        console.error('<cmd> [...args]');
        process.exit(-1);
    }

    // console.debug("running", cmd, args);
    const proc = spwan(cmd, args, {
        stdio: 'inherit',
        shell: true,
        env: finalEnv,
    });

    // Handle any termination signals for parent and child proceses
    const signals = new TermSignals();
    signals.handleUncaughtExceptions();
    signals.handleTermSignals(proc);
};
