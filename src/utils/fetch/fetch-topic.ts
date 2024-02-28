import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import * as Env from '../env';


export type TopicType = 'lecture' | 'meeting';


export type LectureTopic = Record<
    'name' | 'topic', string
>


export type MeetingTopic = Record<
    'name' | 'id', string
>


export type Topic = {
    'id': string,
    'type': TopicType,
    'database': LectureTopic[] | MeetingTopic[]
}


/*
    주제/논제를 가져옴.

    :id: 주제/논제 데이터베이스의 아이디
*/
export const retrieveTopic = async (id: string): Promise<Topic> => {
  const queryFilter = {
    filter: {
      property: Env.NAME_COL,
      title: {
        // eslint-disable-next-line camelcase
        is_not_empty: true,
      },
    },
  };

  const response = await fetch(`api/v1/databases/${id}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
      Authorization: `Bearer ${Env.NOTION_API_KEY}`,
    },
    body: JSON.stringify(queryFilter),
  }).then((res) => res.json());

  const results = response.results as PageObjectResponse[];

  // 지식 나눔 데이터베이스
  if ('주제' in results[0].properties) {
    return {'id': id, 'type': 'lecture', 'database': formatToLectureTopic(results)} as Topic;
  }

  return {'id': id, 'type': 'meeting', 'database': formatToConferenceTopic(results)} as Topic;
};


/*
    데이터 베이스의 내용을 [주제] 데이터 베이스 형식으로 바꿈.

    :records: 데이터베이스
*/
const formatToLectureTopic = (root: PageObjectResponse[]): LectureTopic[] => {
    type RecordProperty = Record<
        '이름' | '주제', {
            title: { plain_text?: string }[],
            rich_text?: { plain_text?: string }[]
        }
    >;

    const topics = root
      .map(
        record => {
          const properties = record.properties as RecordProperty;

          return {
            'name': properties.이름.title[0].plain_text!,
            'topic': properties.주제.rich_text![0].plain_text ?? ''
          } as LectureTopic;
        }
      );

    return topics;
};


/*
    데이터 베이스의 내용을 [논제] 데이터 베이스 형식으로 바꿈.

    :records: 데이터베이스
*/
const formatToConferenceTopic = (root: PageObjectResponse[]): MeetingTopic[] => {
    type RecordProperty = Record<
        '이름', {
            title: { plain_text?: string }[]
        }
    >;
    const topics = root
      .map(
        record => {
          const properties = record.properties as RecordProperty;

          return {
            'name': properties.이름.title[0].plain_text!,
            'id': record.url.slice(
              record.url.lastIndexOf('/') + 1
            )
          } as MeetingTopic;
        }
      );

    return topics;
};
