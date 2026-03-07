import { FastifyRequest, FastifyReply } from 'fastify';
import { ProjectsService } from './projects.service';

export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const project = await this.projectsService.create(request.user!.userId, request.body as any);
    reply.status(201).send({ success: true, data: project });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { projectId } = request.params as { projectId: string };
    const project = await this.projectsService.getById(projectId);
    reply.status(200).send({ success: true, data: project });
  };

  getMyProjects = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const projects = await this.projectsService.getMyProjects(request.user!.userId);
    reply.status(200).send({ success: true, data: projects });
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { projectId } = request.params as { projectId: string };
    const project = await this.projectsService.update(
      request.user!.userId,
      projectId,
      request.body as any,
    );
    reply.status(200).send({ success: true, data: project });
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { projectId } = request.params as { projectId: string };
    await this.projectsService.delete(request.user!.userId, projectId);
    reply.status(200).send({ success: true });
  };
}
