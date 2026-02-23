const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');
const {
    validateGroupCreation,
    validateGroupJoin,
    validatePostCreation
} = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Create a new group
router.post('/', authMiddleware, validateGroupCreation, async (req, res) => {
    try {
        const { name } = req.body;

        // Generate simple 6-character invite code
        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const group = await prisma.group.create({
            data: {
                name,
                inviteCode,
                members: {
                    create: {
                        userId: req.user.userId,
                    },
                }
            },
        });

        res.status(201).json({ group, inviteCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create group' });
    }
});

// Join group via invite code
router.post('/join', authMiddleware, async (req, res) => {
    try {
        const { inviteCode } = req.body;

        const group = await prisma.group.findUnique({
            where: { inviteCode },
            include: { members: true },
        });

        if (!group) return res.status(404).json({ error: 'Invalid invite code' });

        // Check if max members reached
        if (group.members.length >= 10) {
            return res.status(400).json({ error: 'Group has reached maximum limit of 10 members' });
        }

        // Check if already member
        const isMember = group.members.some(m => m.userId === req.user.userId);
        if (isMember) return res.status(400).json({ error: 'You are already in this group' });

        await prisma.groupMember.create({
            data: {
                userId: req.user.userId,
                groupId: group.id,
            },
        });

        res.json({ message: 'Successfully joined group', groupId: group.id, name: group.name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to join group' });
    }
});

// Get Groups for user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const memberships = await prisma.groupMember.findMany({
            where: { userId: req.user.userId },
            include: { group: true },
        });
        const groups = memberships.map(m => m.group);
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

// Get group details and member stats
router.get('/:groupId', authMiddleware, async (req, res) => {
    try {
        const { groupId } = req.params;

        // Verify user is in group
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: { userId: req.user.userId, groupId }
            }
        });
        if (!membership) return res.status(403).json({ error: 'Not authorized for this group' });

        // Include members, their user details, and aggregated mood
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                moodEntries: {
                                    take: 30, // Get up to last 30 for the month
                                    orderBy: { date: 'desc' },
                                }
                            }
                        }
                    }
                }
            }
        });

        // Format stats (Hide raw diaries, output simple aggregated stats instead)
        const membersSummary = group.members.map(m => {
            let veryHappyCount = 0;
            let lowCount = 0;
            m.user.moodEntries.forEach(entry => {
                if (entry.moodLevel >= 4) veryHappyCount++;
                if (entry.moodLevel <= 2) lowCount++;
            });
            return {
                id: m.userId,
                name: m.user.name,
                stats: {
                    veryHappyCount,
                    lowCount,
                    totalEntries: m.user.moodEntries.length
                }
            };
        });

        res.json({
            id: group.id,
            name: group.name,
            inviteCode: group.inviteCode,
            members: membersSummary
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch group details' });
    }
});

// Group Feed (Get Posts)
router.get('/:groupId/feed', authMiddleware, async (req, res) => {
    try {
        const { groupId } = req.params;

        // Verify user is group member
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: { userId: req.user.userId, groupId }
            }
        });
        if (!membership) return res.status(403).json({ error: 'Not authorized to view this group feed' });

        const posts = await prisma.post.findMany({
            where: { groupId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true } },
            }
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

// Create Post in Group
router.post('/:groupId/posts', authMiddleware, async (req, res) => {
    try {
        const { content, type } = req.body;
        const { groupId } = req.params;

        // Verify user is group member
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: { userId: req.user.userId, groupId }
            }
        });
        if (!membership) return res.status(403).json({ error: 'Not authorized to post in this group' });

        const post = await prisma.post.create({
            data: {
                userId: req.user.userId,
                groupId,
                content,
                type: type || 'text', // text or fitness
            },
            include: { user: { select: { name: true } } }
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Like a post
router.post('/:groupId/posts/:postId/like', authMiddleware, async (req, res) => {
    try {
        const { groupId, postId } = req.params;

        // Verify user is group member
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: { userId: req.user.userId, groupId }
            }
        });
        if (!membership) return res.status(403).json({ error: 'Not authorized to like posts in this group' });

        const post = await prisma.post.update({
            where: { id: postId },
            data: { likes: { increment: 1 } },
        });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to like post' });
    }
});

module.exports = router;
