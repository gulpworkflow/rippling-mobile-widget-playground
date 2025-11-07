import React, { useState } from 'react';
import Button from '@rippling/pebble/Button';
import Drawer from '@rippling/pebble/Drawer';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';

const ModalDemo = () => {
  const { theme } = usePebbleTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const toggleCompact = () => {
    setIsCompact(!isCompact);
  };

  return (
    <div
      style={{
        padding: '2rem',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colorSurface,
      }}
    >
      <Button
        onClick={handleOpenDrawer}
        size={Button.SIZES.L}
        appearance={Button.APPEARANCES.PRIMARY}
      >
        Open Drawer
      </Button>

      <Drawer
        isVisible={isDrawerOpen}
        onCancel={handleCloseDrawer}
        title="Lorem Ipsum Drawer"
        isCompact={isCompact}
      >
        <div style={{ padding: '1rem 0' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Button
              appearance={Button.APPEARANCES.OUTLINE}
              onClick={toggleCompact}
              size={Button.SIZES.S}
            >
              {isCompact ? 'Disable Compact Mode' : 'Enable Compact Mode'}
            </Button>
          </div>
          <p style={{ marginBottom: '1rem' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
            architecto beatae vitae dicta sunt explicabo.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
            consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
            quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
            voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint
            occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt
            mollitia animi, id est laborum et dolorum fuga.
          </p>

          <p>
            Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta
            nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere
            possimus, omnis voluptas assumenda est, omnis dolor repellendus.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe
            eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum
            rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias
            consequatur aut perferendis doloribus asperiores repellat.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
            architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas
            sit aspernatur aut odit aut fugit.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.
            Risus commodo viverra maecenas accumsan lacus vel facilisis. Ut faucibus pulvinar
            elementum integer enim neque volutpat ac.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Mauris augue neque gravida in fermentum et sollicitudin ac orci. Diam maecenas ultricies
            mi eget mauris pharetra et ultrices neque. Tellus at urna condimentum mattis
            pellentesque id nibh tortor. Scelerisque varius morbi enim nunc faucibus a pellentesque
            sit amet.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Vitae proin sagittis nisl rhoncus mattis rhoncus urna neque viverra. Gravida rutrum
            quisque non tellus orci ac auctor augue mauris. Semper risus in hendrerit gravida rutrum
            quisque non tellus. Ac ut consequat semper viverra nam libero justo laoreet sit.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Eget arcu dictum varius duis at consectetur lorem donec. Facilisis mauris sit amet massa
            vitae tortor condimentum lacinia quis. Facilisi morbi tempus iaculis urna id volutpat.
            Dictum varius duis at consectetur lorem donec massa sapien faucibus.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Tristique nulla aliquet enim tortor at auctor urna nunc id. Adipiscing tristique risus
            nec feugiat in fermentum posuere urna. Imperdiet proin fermentum leo vel orci porta non
            pulvinar. Ultricies lacus sed turpis tincidunt id aliquet risus feugiat in.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Arcu risus quis varius quam quisque id diam vel. Ultrices tincidunt arcu non sodales
            neque sodales ut etiam sit. Sit amet risus nullam eget felis eget nunc lobortis. Turpis
            egestas maecenas pharetra convallis posuere morbi leo urna molestie.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Bibendum est ultricies integer quis auctor elit sed. Enim ut sem viverra aliquet eget
            sit. Morbi non arcu risus quis varius. Massa tincidunt nunc pulvinar sapien et ligula
            ullamcorper malesuada proin. Dignissim convallis aenean et tortor at risus viverra
            adipiscing.
          </p>

          <p style={{ marginBottom: '1rem' }}>
            Consequat nisl vel pretium lectus quam id leo in vitae. Sollicitudin aliquam ultrices
            sagittis orci a scelerisque purus semper. Adipiscing diam donec adipiscing tristique
            risus nec feugiat in fermentum. Sed blandit libero volutpat sed cras ornare arcu dui.
          </p>

          <p>
            Pharetra vel turpis nunc eget lorem dolor sed viverra. Pretium quam vulputate dignissim
            suspendisse in est ante in nibh. Volutpat consequat mauris nunc congue nisi vitae
            suscipit tellus. Massa vitae tortor condimentum lacinia quis vel eros donec ac.
          </p>
        </div>

        <Drawer.Footer>
          <Drawer.CloseButton>Cancel</Drawer.CloseButton>
          <Button
            appearance={Button.APPEARANCES.PRIMARY}
            onClick={handleCloseDrawer}
            size={Button.SIZES.M}
          >
            Confirm
          </Button>
        </Drawer.Footer>
      </Drawer>
    </div>
  );
};

export default ModalDemo;
