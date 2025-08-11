const { Group, GroupMember } = require('../models');

exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id; // From JWT middleware

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Create group
    const group = await Group.create({ name, createdBy: userId });

    // Add creator as admin
    await GroupMember.create({
      groupId: group.id,
      userId: userId,
      role: 'admin'
    });

    res.status(201).json({ message: "Group created successfully", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.id;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const alreadyMember = await GroupMember.findOne({
      where: { groupId, userId }
    });
    if (alreadyMember) {
      return res.status(400).json({ message: "Already a member" });
    }

    await GroupMember.create({
      groupId,
      userId,
      role: 'member'
    });

    res.status(200).json({ message: "Joined group successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
