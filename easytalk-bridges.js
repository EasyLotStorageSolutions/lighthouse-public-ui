import {
    createEasyTalkPairing,
    decideEasyTalkApproval,
    deleteEasyTalkAccount,
    exportEasyTalkData,
    getEasyTalkContract,
    getEasyTalkPortal,
    revokeEasyTalkDevice,
    submitEasyTalkTask,
    completeEasyAttention,
    createEasyAsset,
    recordEasyCaseOutcome,
    startEasyCaseRecovery,
    createEasyCaseInvite,
    redeemEasyCaseInvite,
    createEasySolutionBrief,
    prepareEasyVideoEvidence,
    completeEasyVideoEvidence,
    deleteEasyVideoEvidence,
    getLighthouseMemberAccess,
    searchLighthouseComplimentaryCandidates,
    listLighthouseComplimentaryAccess,
    grantLighthouseComplimentaryAccess,
    revokeLighthouseComplimentaryAccess,
    extendLighthouseComplimentaryAccess,
    setLighthouseOwnerViewMode,
    getLighthouseOwnerOperations,
    setLighthouseWorkAvailability,
    setLighthouseWorkProfile,
    setLighthouseMatchingPermission,
    requestLighthouseMatch,
    decideLighthouseMatch,
    reportLighthouseCommitmentFailure,
    confirmLighthouseCommitmentOutcome,
    createLighthouseCommitment,
    cancelLighthouseCommitment,
    addLighthouseStudioComment,
    applyLighthouseStudioOperation,
    changeLighthouseStudioCollaborator,
    completeLighthouseStudioAsset,
    createLighthouseStudioProject,
    deleteLighthouseStudioAsset,
    exportLighthouseStudioProject,
    getLighthouseStudioContract,
    getLighthouseStudioProject,
    listLighthouseStudioProjects,
    prepareLighthouseStudioAsset,
    queueLighthouseStudioMediaJob,
    redoLighthouseStudioProject,
    undoLighthouseStudioProject
} from 'backend/easytalk';
import {
    getPublicLighthouseChannelFeature,
    saveLighthouseChannelFeature
} from 'backend/marketplace';

const errorMessage = error => error instanceof Error ? error.message : String(error || 'Lighthouse request failed.');

export function wireEasyTalkPortal($w, componentId = 'html1', options = {}) {
    const element = $w(`#${componentId}`);
    if (!element || typeof element.onMessage !== 'function') return;
    // The Wix page owns vertical scrolling. A second scrollbar inside the
    // embedded workspace makes the portal feel like two pages were stacked.
    if ('scrolling' in element) element.scrolling = 'no';
    if (typeof element.expand === 'function') element.expand();
    if (typeof element.show === 'function') element.show();
    let hydrationPromise = null;
    const hydratePortal = () => {
        if (hydrationPromise) return hydrationPromise;
        hydrationPromise = (async () => {
            const access = await getLighthouseMemberAccess();
            if (!access.entitled) {
                if (options.initialView === 'studio' && access.state !== 'SIGNED_OUT') {
                    const [contract, projects] = await Promise.all([getLighthouseStudioContract(), listLighthouseStudioProjects()]);
                    element.postMessage({ type: 'studio:standalone', entitlement: 'STUDIO_FREE' });
                    element.postMessage({ type: 'studio:data', contract, projects });
                    element.postMessage({ type: 'easytalk:navigate', view: 'studio' });
                    options.initialView = '';
                    return;
                }
                element.postMessage({ type: 'easytalk:access', access });
                return;
            }
            if (options.caseInvite) {
                await redeemEasyCaseInvite({ token: options.caseInvite });
                options.caseInvite = '';
                element.postMessage({ type: 'easy:inviteRedeemed', message: 'Case Room invitation accepted.' });
            }
            element.postMessage({ type: 'easytalk:data', portal: await getEasyTalkPortal(), contract: await getEasyTalkContract() });
            if (options.initialView === 'studio') {
                element.postMessage({ type: 'easytalk:navigate', view: 'studio' });
                options.initialView = '';
            }
        })().finally(() => { hydrationPromise = null; });
        return hydrationPromise;
    };
    element.onMessage(async event => {
        const message = event.data || {};
        try {
            if (message.type === 'easytalk:ready' || message.type === 'easytalk:refresh') {
                await hydratePortal();
            }
            if (message.type === 'easytalk:submit') {
                const job = await submitEasyTalkTask(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: job.summary || 'Lighthouse organized the next step.' });
            }
            if (message.type === 'easytalk:approval') {
                await decideEasyTalkApproval(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'Approval decision recorded.' });
            }
            if (message.type === 'easytalk:createPairing') {
                const pairing = await createEasyTalkPairing();
                element.postMessage({ type: 'easytalk:pairing', pairing });
            }
            if (message.type === 'easytalk:revokeDevice') {
                await revokeEasyTalkDevice(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'Worker revoked.' });
            }
            if (message.type === 'easytalk:export') {
                const result = await exportEasyTalkData();
                element.postMessage({ type: 'easytalk:exportReady', result });
            }
            if (message.type === 'easytalk:delete') {
                const result = await deleteEasyTalkAccount();
                element.postMessage({ type: 'easytalk:deletionRequested', result });
            }
            if (message.type === 'easy:attentionComplete') {
                await completeEasyAttention(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'Review completed.' });
            }
            if (message.type === 'easy:assetCreate') {
                await createEasyAsset(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'Asset saved to your private memory.' });
            }
            if (message.type === 'easy:caseOutcome') {
                await recordEasyCaseOutcome(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'Outcome recorded.' });
            }
            if (message.type === 'easy:caseRecovery') {
                await startEasyCaseRecovery(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'Recovery started. The case and its history were preserved.' });
            }
            if (message.type === 'easy:caseInvite') {
                const invite = await createEasyCaseInvite(message.data || {});
                element.postMessage({ type: 'easy:caseInviteCreated', invite });
            }
            if (message.type === 'easy:solutionBrief') {
                const brief = await createEasySolutionBrief(message.data || {});
                element.postMessage({ type: 'easy:solutionBriefCreated', brief });
            }
            if (message.type === 'easy:videoUploadPrepare') {
                const upload = await prepareEasyVideoEvidence(message.data || {});
                element.postMessage({ type: 'easy:videoUploadPrepared', upload });
            }
            if (message.type === 'easy:videoEvidenceCommit') {
                const result = await completeEasyVideoEvidence(message.data || {});
                element.postMessage({ type: 'easy:videoEvidenceSaved', result });
            }
            if (message.type === 'easy:videoEvidenceDelete') {
                await deleteEasyVideoEvidence(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'Video evidence deleted.' });
            }
            if (message.type === 'lighthouse:availability') {
                await setLighthouseWorkAvailability(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'Your availability was updated.' });
            }
            if (message.type === 'lighthouse:workProfile') {
                await setLighthouseWorkProfile(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'Your private work profile was updated.' });
            }
            if (message.type === 'lighthouse:matchingPermission') {
                await setLighthouseMatchingPermission(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: message.data?.enabled ? 'Private matching suggestions are on.' : 'Matching permission was revoked.' });
            }
            if (message.type === 'lighthouse:matchRequest') {
                const result = await requestLighthouseMatch(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: result.message || 'Lighthouse checked for a safe fit.' });
            }
            if (message.type === 'lighthouse:matchDecision') {
                const result = await decideLighthouseMatch(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: result.status === 'ACCEPTED' ? 'Both people accepted. The next step is now tracked.' : result.status === 'DECLINED' ? 'Pass recorded. There is no penalty.' : 'Waiting for the other person to accept.' });
            }
            if (message.type === 'lighthouse:commitmentFailure') {
                const result = await reportLighthouseCommitmentFailure(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: result.replacementMatchId ? 'That option fell through. Lighthouse found another possible fit.' : 'That option fell through. Lighthouse kept the original request open for recovery.' });
            }
            if (message.type === 'lighthouse:commitmentConfirm') {
                const result = await confirmLighthouseCommitmentOutcome(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: result.completionVerified ? 'The result was verified and the request is complete.' : 'Your confirmation was recorded. Waiting for the other person.' });
            }
            if (message.type === 'lighthouse:commitmentCreate') {
                await createLighthouseCommitment(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'The next step is now tracked.' });
            }
            if (message.type === 'lighthouse:commitmentCancel') {
                await cancelLighthouseCommitment(message.data || {});
                element.postMessage({ type: 'easytalk:changed', message: 'The tracked commitment was cancelled.' });
            }
            if (message.type === 'studio:load') {
                const [contract, projects] = await Promise.all([getLighthouseStudioContract(), listLighthouseStudioProjects()]);
                element.postMessage({ type: 'studio:data', contract, projects });
            }
            if (message.type === 'studio:createProject') {
                const result = await createLighthouseStudioProject(message.data || {});
                element.postMessage({ type: 'studio:project', result, message: 'Studio project created.' });
            }
            if (message.type === 'studio:openProject') {
                const result = await getLighthouseStudioProject(message.data || {});
                element.postMessage({ type: 'studio:project', result });
            }
            if (message.type === 'studio:operation') {
                const result = await applyLighthouseStudioOperation(message.data || {});
                element.postMessage({ type: 'studio:project', result, message: 'Studio edit saved.' });
            }
            if (message.type === 'studio:undo' || message.type === 'studio:redo') {
                const result = message.type === 'studio:undo'
                    ? await undoLighthouseStudioProject(message.data || {})
                    : await redoLighthouseStudioProject(message.data || {});
                element.postMessage({ type: 'studio:project', result, message: message.type === 'studio:undo' ? 'Edit undone.' : 'Edit restored.' });
            }
            if (message.type === 'studio:prepareAsset') {
                const upload = await prepareLighthouseStudioAsset(message.data || {});
                element.postMessage({ type: 'studio:assetPrepared', upload });
            }
            if (message.type === 'studio:completeAsset') {
                const result = await completeLighthouseStudioAsset(message.data || {});
                element.postMessage({ type: 'studio:project', result, message: 'Media added to the Studio project.' });
            }
            if (message.type === 'studio:mediaJob') {
                const job = await queueLighthouseStudioMediaJob(message.data || {});
                element.postMessage({ type: 'studio:mediaJobQueued', job, message: job.status === 'running' ? 'Studio media worker is processing this now.' : 'Studio media worker accepted the job.' });
            }
            if (message.type === 'studio:deleteAsset') {
                const result = await deleteLighthouseStudioAsset(message.data || {});
                element.postMessage({ type: 'studio:project', result, message: 'Media moved to trash.' });
            }
            if (message.type === 'studio:export') {
                const result = await exportLighthouseStudioProject(message.data || {});
                element.postMessage({ type: 'studio:exportReady', result });
            }
            if (message.type === 'studio:comment') {
                const comment = await addLighthouseStudioComment(message.data || {});
                element.postMessage({ type: 'studio:commentSaved', comment, message: 'Project comment saved to this version.' });
            }
            if (message.type === 'studio:collaborator') {
                const project = await changeLighthouseStudioCollaborator(message.data || {});
                element.postMessage({ type: 'studio:collaboratorChanged', project, message: 'Project access updated.' });
            }
            if (message.type === 'lighthouse-owner:search') {
                const members = await searchLighthouseComplimentaryCandidates(message.data || {});
                element.postMessage({ type: 'lighthouse-owner:searchResults', members });
            }
            if (message.type === 'lighthouse-owner:refresh') {
                const [owner, members, channelFeature] = await Promise.all([
                    getLighthouseOwnerOperations(),
                    listLighthouseComplimentaryAccess(),
                    getPublicLighthouseChannelFeature()
                ]);
                element.postMessage({ type: 'lighthouse-owner:data', owner, members, channelFeature });
            }
            if (message.type === 'lighthouse-owner:channelFeature') {
                const channelFeature = await saveLighthouseChannelFeature(message.data || {});
                element.postMessage({ type: 'lighthouse-owner:channelFeatureSaved', channelFeature, message: 'Lighthouse Channel feature updated.' });
            }
            if (message.type === 'lighthouse-owner:grant') {
                await grantLighthouseComplimentaryAccess(message.data || {});
                element.postMessage({ type: 'lighthouse-owner:changed', message: 'Complimentary access granted.' });
            }
            if (message.type === 'lighthouse-owner:revoke') {
                await revokeLighthouseComplimentaryAccess(message.data || {});
                element.postMessage({ type: 'lighthouse-owner:changed', message: 'Complimentary access revoked.' });
            }
            if (message.type === 'lighthouse-owner:extend') {
                await extendLighthouseComplimentaryAccess(message.data || {});
                element.postMessage({ type: 'lighthouse-owner:changed', message: 'Complimentary access updated.' });
            }
            if (message.type === 'lighthouse-owner:mode') {
                const owner = await setLighthouseOwnerViewMode(message.data || {});
                element.postMessage({ type: 'lighthouse-owner:modeChanged', owner });
            }
        } catch (error) {
            element.postMessage({ type: 'easytalk:error', error: errorMessage(error) });
        }
    });
    // Custom HTML components may have already emitted their one-time ready
    // message before Wix page code attaches. Hydrate once immediately as a
    // race-safe fallback; later refresh requests still use the same path.
    hydratePortal().catch(error => {
        element.postMessage({ type: 'easytalk:error', error: errorMessage(error) });
    });
}
