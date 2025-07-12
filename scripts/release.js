import { execSync } from 'child_process';


const version = process.argv[2];
if (!version) {
    console.error('Missing version argument. Usage: npm run release -- <version>');
    process.exit(1);
}

try {
    console.log(`Tagging release: ${version}`);

    execSync(`git tag ${version}`, { stdio: 'inherit' });
    execSync(`git push && git push origin ${version}`, { stdio: 'inherit' });

    console.log('Release complete.');
} catch (err) {
    console.error('Release failed.', err);
    process.exit(1);
}

