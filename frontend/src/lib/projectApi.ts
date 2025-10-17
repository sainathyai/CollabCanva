/**
 * Project API Client
 *
 * Functions for interacting with the project API
 */

import type { Project } from '../contexts/ProjectContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * Create a new project
 */
export async function createProject(
  userId: string,
  name: string,
  description?: string
): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects?userId=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.status}`)
  }

  return response.json()
}

/**
 * Get all projects for a user (including collaborative projects)
 */
export async function getUserProjects(userId: string, userEmail?: string): Promise<Project[]> {
  const url = new URL(`${API_BASE_URL}/api/projects`)
  url.searchParams.set('userId', userId)
  if (userEmail) {
    url.searchParams.set('userEmail', userEmail)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`)
  }

  const data = await response.json()
  return data.projects
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.status}`)
  }

  return response.json()
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  userId: string,
  updates: {
    name?: string
    description?: string
    isPublic?: boolean
    thumbnailUrl?: string
  }
): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}?userId=${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error(`Failed to update project: ${response.status}`)
  }

  return response.json()
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}?userId=${userId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.status}`)
  }
}

/**
 * Add a collaborator to a project
 */
export async function addCollaborator(projectId: string, userId: string, email: string, role: 'editor' | 'viewer' = 'editor'): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/collaborators?userId=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, role }),
  })

  if (!response.ok) {
    throw new Error(`Failed to add collaborator: ${response.status}`)
  }

  return response.json()
}

/**
 * Remove a collaborator from a project
 */
export async function removeCollaborator(projectId: string, userId: string, email: string): Promise<Project> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/collaborators/${encodeURIComponent(email)}?userId=${userId}`,
    {
      method: 'DELETE',
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to remove collaborator: ${response.status}`)
  }

  return response.json()
}

