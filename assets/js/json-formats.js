(function(global){
  'use strict';

  const APPLICATION_ID='archivo-de-rol';
  const FORMAT_VERSION=1;

  class ArchivoRolJSONError extends Error{
    constructor(code,message,details={}){
      super(message);
      this.name='ArchivoRolJSONError';
      this.code=code;
      this.details=details;
    }
  }

  function isObject(value){
    return value!==null&&typeof value==='object'&&!Array.isArray(value);
  }

  function legacyDescriptor(document){
    if(Array.isArray(document?.characters)){
      return {
        application:APPLICATION_ID,
        formatVersion:0,
        module:'character-sheet',
        system:'dnd-5e-2024',
        entity:'character',
        schemaVersion:0
      };
    }

    const possibleWorld=document?.world??document?.state??document;
    if(
      isObject(document?._worldFile)||
      typeof document?.worldId==='string'||
      (
        isObject(possibleWorld)&&
        isObject(possibleWorld.settings)&&
        typeof possibleWorld.settings.worldName==='string'
      )
    ){
      return {
        application:APPLICATION_ID,
        formatVersion:0,
        module:'worldbuilding',
        system:'agnostic',
        entity:'world',
        schemaVersion:0
      };
    }

    return null;
  }

  function normalizeDescriptor(source){
    return {
      application:String(source?.application||''),
      formatVersion:Number(source?.formatVersion)||0,
      module:String(source?.module||''),
      system:String(source?.system||''),
      entity:String(source?.entity||''),
      schemaVersion:Number(source?.schemaVersion)||0,
      exportedAt:source?.exportedAt?String(source.exportedAt):''
    };
  }

  function inspect(document){
    if(!isObject(document)){
      throw new ArchivoRolJSONError('INVALID_DOCUMENT','El contenido JSON debe ser un objeto.');
    }

    if(isObject(document._archivoRol)){
      const descriptor=normalizeDescriptor(document._archivoRol);
      if(descriptor.application&&descriptor.application!==APPLICATION_ID){
        throw new ArchivoRolJSONError(
          'INCOMPATIBLE_APPLICATION',
          'El archivo pertenece a otra aplicación.',
          {actual:descriptor.application}
        );
      }
      if(descriptor.formatVersion>FORMAT_VERSION){
        throw new ArchivoRolJSONError(
          'UNSUPPORTED_FORMAT_VERSION',
          'El archivo utiliza una versión de formato más reciente.',
          {actual:descriptor.formatVersion,supported:FORMAT_VERSION}
        );
      }
      return {
        descriptor,
        data:isObject(document.data)?document.data:document,
        legacy:false
      };
    }

    const descriptor=legacyDescriptor(document);
    if(!descriptor){
      throw new ArchivoRolJSONError('UNKNOWN_DOCUMENT','No se reconoce el tipo de archivo JSON.');
    }
    return {
      descriptor,
      data:document,
      legacy:true
    };
  }

  function read(document,expected){
    const result=inspect(document);
    const descriptor=result.descriptor;
    for(const field of ['module','system','entity']){
      const wanted=String(expected?.[field]||'');
      const actual=String(descriptor[field]||'');
      if(wanted&&actual&&wanted!==actual){
        throw new ArchivoRolJSONError(
          'INCOMPATIBLE_DOCUMENT',
          'El archivo no corresponde a esta herramienta.',
          {field,expected:wanted,actual,descriptor}
        );
      }
    }
    return result;
  }

  function tag(payload,descriptor){
    if(!isObject(payload)){
      throw new ArchivoRolJSONError('INVALID_PAYLOAD','Los datos exportados deben ser un objeto.');
    }
    const metadata={
      application:APPLICATION_ID,
      formatVersion:FORMAT_VERSION,
      module:String(descriptor?.module||''),
      system:String(descriptor?.system||''),
      entity:String(descriptor?.entity||''),
      schemaVersion:Number(descriptor?.schemaVersion)||1,
      exportedAt:new Date().toISOString()
    };
    return {...payload,_archivoRol:metadata};
  }

  function describe(descriptor){
    const system=descriptor?.system==='agnostic'
      ?'herramienta de worldbuilding'
      :descriptor?.system||'sistema desconocido';
    const entity=descriptor?.entity||'datos';
    return entity+' · '+system;
  }

  global.ArchivoRolJSON=Object.freeze({
    APPLICATION_ID,
    FORMAT_VERSION,
    Error:ArchivoRolJSONError,
    inspect,
    read,
    tag,
    describe
  });
})(window);
