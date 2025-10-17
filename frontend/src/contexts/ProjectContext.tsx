/**
 * Project Context
 *
 * Manages current project state and provides project-related functions
 */

import React, { createContext, useContext, useState, useCallback } from 'react'
import { getProject as fetchProject } from '../lib/projectApi'

export type UserRole = 'owner' | 'editor' | 'viewer'

export interface Collaborator {
  email: string
  role: UserRole
}

export interface Project {
  projectId: string
  ownerId: string
  name: string
  description?: string
  isPublic: boolean
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
  collaborators?: Collaborator[]
}

interface ProjectContextType {
  // Current project
  currentProjectId: string | null
  currentProject: Project | null

  // Actions
  setCurrentProject: (project: Project | null) => void
  setCurrentProjectId: (projectId: string | null) => void
  switchProject: (projectId: string) => Promise<void>

  // Project list
  projects: Project[]
  setProjects: (projects: Project[]) => void

  // Loading states
  isLoadingProject: boolean
  setIsLoadingProject: (loading: boolean) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProject, setIsLoadingProject] = useState(false)

  const switchProject = useCallback(async (projectId: string) => {
    setIsLoadingProject(true)
    try {
      // Fetch project details
      const project = await fetchProject(projectId)
      setCurrentProject(project)
      setCurrentProjectId(projectId)
    } catch (error) {
      console.error('Failed to switch project:', error)
      throw error
    } finally {
      setIsLoadingProject(false)
    }
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        currentProjectId,
        currentProject,
        setCurrentProject,
        setCurrentProjectId,
        switchProject,
        projects,
        setProjects,
        isLoadingProject,
        setIsLoadingProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

