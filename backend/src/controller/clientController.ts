
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/clients - Retrieve all clients
export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch clients.' });
  }
};

// POST /api/clients - Create a new client
export const createClient = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ success: false, error: 'Full name and email are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password || 'ClientDefault123!', 10);

    const newClient = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role: 'CLIENT',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: {
        id: newClient.id,
        fullName: newClient.fullName,
        email: newClient.email,
        phone: newClient.phone,
      },
    });
  } catch (error) {
    console.error('Failed to create client:', error);
    return res.status(500).json({ success: false, error: 'Failed to create client on server.' });
  }
};

// PUT /api/clients/:id - Update an existing client
export const updateClient = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { fullName, email, phone, password } = req.body;

    const existingClient = await prisma.user.findUnique({ where: { id } });
    if (!existingClient || existingClient.role !== 'CLIENT') {
      return res.status(404).json({ success: false, error: 'Client not found.' });
    }

    let passwordHash = existingClient.passwordHash;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedClient = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName !== undefined ? fullName : existingClient.fullName,
        email: email !== undefined ? email : existingClient.email,
        phone: phone !== undefined ? phone : existingClient.phone,
        passwordHash,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: {
        id: updatedClient.id,
        fullName: updatedClient.fullName,
        email: updatedClient.email,
        phone: updatedClient.phone,
      },
    });
  } catch (error) {
    console.error('Failed to update client:', error);
    return res.status(500).json({ success: false, error: 'Failed to update client.' });
  }
};

// DELETE /api/clients/:id - Delete a client record
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const existingClient = await prisma.user.findUnique({ where: { id } });
    if (!existingClient || existingClient.role !== 'CLIENT') {
      return res.status(404).json({ success: false, error: 'Client not found.' });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete client:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete client.' });
  }
};