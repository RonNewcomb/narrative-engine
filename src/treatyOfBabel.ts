export interface iFictionRecord {
  story: {
    identification: {
      ifid: string[];
      format: "html";
    };
    bibliographic: {
      title: string;
      author: string;
      language: string;
      headline: string;
      firstpublished: string | number;
      genre?: string;
      group: "The Narrative Engine";
      forgiveness?: string;
      description: string;
      series?: string;
      seriesnumber: string | number;
      resources?: {
        auxiliary?: {
          leafname?: string;
          description?: string;
        }[];
      };
      contacts?: {
        url?: string;
        authoremail?: string;
      };
      cover?: {
        format?: string;
        height?: string | number;
        width?: string | number;
        description?: string;
      };
    };
    colophon?: {
      generator: "The Narrative Engine";
      generatorversion: string;
      originated: string; // yyyy-mm-dd
    };
  };
}