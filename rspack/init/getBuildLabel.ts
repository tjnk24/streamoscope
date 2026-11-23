import {spawnSync} from 'node:child_process';

export const getBuildLabel = () => {
    if (process.env.GITHUB_REF_TYPE === 'tag') {
        return '';
    }

    const description = spawnSync('git', ['describe', '--tags', '--always', '--dirty', '--match', 'v*'], {encoding: 'utf8'});

    return description.status === 0 ? description.stdout.trim() : 'unknown';
};
