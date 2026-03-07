import { FastifyRequest, FastifyReply } from 'fastify';
import { SkillsService } from './skills.service';

export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  listAll = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const skills = await this.skillsService.listAll();
    reply.status(200).send({ success: true, data: skills });
  };

  getMySkills = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const skills = await this.skillsService.getStudentSkills(request.user!.userId);
    reply.status(200).send({ success: true, data: skills });
  };

  addSkill = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { name } = request.body as { name: string };
    const skill = await this.skillsService.addSkillToStudent(request.user!.userId, name);
    reply.status(201).send({ success: true, data: skill });
  };

  removeSkill = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { skillId } = request.params as { skillId: string };
    const id = parseInt(skillId, 10);
    if (isNaN(id)) {
      reply.status(400).send({ success: false, error: 'Invalid skill ID' });
      return;
    }
    await this.skillsService.removeSkillFromStudent(request.user!.userId, id);
    reply.status(200).send({ success: true });
  };
}
