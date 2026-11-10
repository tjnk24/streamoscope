import type {components, operations} from '@octokit/openapi-types';
import type {Nullable} from 'infrastructure/common';

import {CompatibilityDto} from './compatibility';

export type VersionDto = {
    major: number;
    minor: number;
    patch: number;
};

export type GithubReleaseDto = Pick<
    components['schemas']['release'],
    'tag_name' | 'html_url' | 'body' | 'published_at' | 'draft' | 'prerelease'
>;

export type GithubReleasesQueryDto = NonNullable<operations['repos/list-releases']['parameters']['query']>;

export type ReleaseDto = {
    version: string;
    url: string;
    notes: string;
    publishedAt: Nullable<string>;
    compatibility: Nullable<CompatibilityDto>;
};
