import { Controller, Get, Render, Post, Body, Res } from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { NewAnimalDTO } from 'interfaces/newAnimalDTO';
import { Response } from 'express';

const conn = mysql.createPool({
  host: 'localhost',
  //port: 3306,
  user: 'root',
  password: '',
  database: 'zoodatabase',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @Render('index')
  async index() {
    const [data] = await conn.execute('SELECT id, nev, eletkor, faj FROM allatok');
    return { title: 'Állatok', index: data };
  }
  @Get('/animalForm')
  @Render('animalForm')
  form() {
    return { title: 'Állat felvétele', errors: [] };
  }

  @Post('/animalForm')
  @Render('animalForm')
  async formPost(@Body() newAnimal: NewAnimalDTO, @Res() res: Response) {
    const errors: string[] = [];
    if (newAnimal.nev.trim() === '') {
      errors.push('Adja meg az állat nevét!');
    }
    if (newAnimal.eletkor <= 0 || isNaN(newAnimal.eletkor)) {
      errors.push('Az állat életkora legalább 1 év kell hogy legyen!');
    }

    if (errors.length > 0) {
      res.render('animalForm', { title: 'Állat felvétele', errors });
    } else {
      const nev: string = newAnimal.nev;
      const eletkor: number = newAnimal.eletkor;
      const faj: string = newAnimal.faj;
      const [data] = await conn.execute('INSERT INTO allatok (nev, eletkor, faj) VALUES (?, ?, ?)', [nev, eletkor, faj]);
      res.redirect('/');
    }
  }
}
